<?php
/**
 * BULL Moldova — endpoint „Cere ofertă" pentru hosting cPanel (Apache + PHP 7.4+).
 * URL public: /api/lead  (rescris din .htaccess către acest fișier)
 *
 * 1. Validează numele și telefonul (+373 + 8 cifre) și ignoră boții (câmpul-capcană „website").
 * 2. Creează lead + contact în amoCRM (/api/v4/leads/complex), cu tag-uri și o notă cu detaliile (UTM, pagina).
 * 3. Dacă amoCRM nu e configurat sau răspunde cu eroare → e-mail de rezervă (mail() din cPanel).
 * 4. Dacă nu merge niciun canal → 502, iar formularul îi arată vizitatorului telefonul și WhatsApp-ul.
 *
 * Configurarea (token amoCRM etc.) stă în bull-config.php, ÎN AFARA folderului public
 * (ex. /home/<user>/bull-config.php). Model: bull-config.example.php din repository.
 */

declare(strict_types=1);

header('X-Robots-Tag: noindex');

function respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function load_config(): array
{
    $defaults = [
        'amocrm_base_url' => '',
        'amocrm_access_token' => '',
        'amocrm_pipeline_id' => 0,
        'amocrm_status_id' => 0,
        'amocrm_responsible_user_id' => 0,
        'webhook_url' => '',
        'email_to' => 'marketing@ozonteh.md',
        'email_from' => 'BULL Moldova <noreply@bull.ozonteh.md>',
    ];
    $candidates = array_filter([
        getenv('BULL_CONFIG') ?: null,
        dirname(__DIR__, 3) . '/bull-config.php', // /home/<user>/bull-config.php când site-ul e în public_html/bull.ozonteh.md
        dirname(__DIR__, 2) . '/bull-config.php',
        __DIR__ . '/../bull-config.php',
    ]);
    foreach ($candidates as $file) {
        if (is_readable($file)) {
            $cfg = include $file;
            if (is_array($cfg)) {
                return array_merge($defaults, $cfg);
            }
        }
    }
    return $defaults;
}

function str_field($v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = trim(preg_replace('/[\x00-\x1F\x7F]/u', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
}

/** @return array|null */
const REQUEST_LABELS = ['service' => 'Service', 'piese' => 'Piese de schimb', 'garantie' => 'Garanție', 'altele' => 'Altă solicitare'];

/** Titlul cererii: ofertă (cu sau fără demonstrație) sau solicitare de service/piese. */
function lead_title(array $l): string
{
    if ($l['request'] !== '') {
        return 'Solicitare ' . mb_strtolower(REQUEST_LABELS[$l['request']]) . ' BULL Moldova';
    }
    return 'Cerere ofertă BULL Moldova' . ($l['demo'] ? ' + DEMONSTRAȚIE' : '');
}

function normalize_lead(array $d)
{
    $name = str_field($d['name'] ?? '', 80);
    $digits = preg_replace('/\D/', '', (string) ($d['phone'] ?? '')) ?? '';
    if (strpos($digits, '373') === 0) {
        $digits = substr($digits, 3);
    }
    if (strpos($digits, '0') === 0) {
        $digits = substr($digits, 1);
    }
    if (mb_strlen($name) < 2 || !preg_match('/^[2-9]\d{7}$/', $digits)) {
        return null;
    }
    $source = [];
    if (isset($d['source']) && is_array($d['source'])) {
        foreach (array_slice($d['source'], 0, 12, true) as $k => $v) {
            if (is_string($v)) {
                $source[mb_substr((string) $k, 0, 30)] = mb_substr($v, 0, 200);
            }
        }
    }
    $demo = $d['demo'] ?? false;
    // Formularul de pe „Service și piese" trimite și tipul solicitării.
    $request = (string) ($d['request'] ?? '');
    if (!array_key_exists($request, REQUEST_LABELS)) {
        $request = '';
    }
    return [
        'name' => $name,
        'phone' => '+373' . $digits,
        'model' => str_field($d['model'] ?? '', 80),
        'message' => str_field($d['message'] ?? '', 1500),
        'demo' => $demo === true || $demo === '1' || $demo === 'on',
        'request' => $request,
        'lang' => (($d['lang'] ?? '') === 'ru') ? 'ru' : 'ro',
        'page' => str_field($d['page'] ?? '', 300),
        'source' => $source,
    ];
}

function summary(array $l): string
{
    $lines = [
        lead_title($l),
        'Nume: ' . $l['name'],
        'Telefon: ' . $l['phone'],
        'Model: ' . ($l['model'] !== '' ? $l['model'] : 'nespecificat'),
    ];
    if ($l['message'] !== '') {
        $lines[] = 'Mesaj: ' . $l['message'];
    }
    $lines[] = 'Limba: ' . strtoupper($l['lang']);
    $lines[] = 'Pagina: ' . $l['page'];
    $src = [];
    foreach ($l['source'] as $k => $v) {
        $src[] = "$k=$v";
    }
    $lines[] = 'Sursă: ' . ($src ? implode(', ', $src) : 'direct');
    return implode("\n", $lines);
}

/** POST JSON; întoarce [status, body]. */
function post_json(string $url, $payload, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_CONNECTTIMEOUT => 6,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($body === false) {
        throw new RuntimeException("rețea: $err");
    }
    return [$status, (string) $body];
}

function to_crm(array $l, array $cfg): bool
{
    if ($cfg['webhook_url'] !== '') {
        [$st] = post_json($cfg['webhook_url'], $l + ['text' => summary($l)]);
        if ($st < 200 || $st >= 300) {
            throw new RuntimeException("webhook $st");
        }
        return true;
    }
    if ($cfg['amocrm_base_url'] === '' || $cfg['amocrm_access_token'] === '') {
        return false;
    }
    $base = rtrim($cfg['amocrm_base_url'], '/');
    $auth = ['Authorization: Bearer ' . $cfg['amocrm_access_token']];
    $kind = $l['request'] !== '' ? 'service-' . $l['request'] : ($l['demo'] ? 'demonstratie' : 'oferta');
    $tags = [['name' => 'site-bull'], ['name' => $kind], ['name' => 'lang-' . $l['lang']]];
    if (!empty($l['source']['utm_source'])) {
        $tags[] = ['name' => mb_substr('utm-' . $l['source']['utm_source'], 0, 50)];
    }
    $lead = [
        'name' => mb_substr('BULL ' . ($l['model'] !== '' ? $l['model'] : 'cerere') . ': ' . $l['name'], 0, 250),
        '_embedded' => [
            'tags' => $tags,
            'contacts' => [[
                'first_name' => $l['name'],
                'custom_fields_values' => [[
                    'field_code' => 'PHONE',
                    'values' => [['value' => $l['phone'], 'enum_code' => 'WORK']],
                ]],
            ]],
        ],
    ];
    foreach (['pipeline_id' => 'amocrm_pipeline_id', 'status_id' => 'amocrm_status_id', 'responsible_user_id' => 'amocrm_responsible_user_id'] as $k => $c) {
        if ((int) $cfg[$c] > 0) {
            $lead[$k] = (int) $cfg[$c];
        }
    }
    [$st, $body] = post_json("$base/api/v4/leads/complex", [$lead], $auth);
    if ($st < 200 || $st >= 300) {
        throw new RuntimeException("amoCRM $st: " . substr($body, 0, 300));
    }
    $created = json_decode($body, true);
    $id = $created[0]['id'] ?? null;
    if ($id) {
        try {
            post_json("$base/api/v4/leads/notes", [[
                'entity_id' => $id,
                'note_type' => 'common',
                'params' => ['text' => summary($l)],
            ]], $auth);
        } catch (Throwable $e) {
            // nota e opțională; lead-ul e deja creat
        }
    }
    return true;
}

function to_email(array $l, array $cfg): bool
{
    if ($cfg['email_to'] === '' || !function_exists('mail')) {
        return false;
    }
    $subject = $l['request'] !== ''
        ? '[SERVICE] ' . REQUEST_LABELS[$l['request']] . ' ' . ($l['model'] !== '' ? $l['model'] : 'BULL') . ': ' . $l['name'] . ' ' . $l['phone']
        : ($l['demo'] ? '[DEMO] ' : '') . 'Cerere ofertă ' . ($l['model'] !== '' ? $l['model'] : 'BULL') . ': ' . $l['name'] . ' ' . $l['phone'];
    $headers = implode("\r\n", [
        'From: ' . $cfg['email_from'],
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: BULL-Moldova-site',
    ]);
    return mail($cfg['email_to'], '=?UTF-8?B?' . base64_encode($subject) . '?=', summary($l), $headers);
}

// ---------- Cerere ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method']);
}

$isJson = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;
$data = $isJson ? json_decode((string) file_get_contents('php://input'), true) : $_POST;
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'body']);
}

$back = function (string $state) {
    $ref = $_SERVER['HTTP_REFERER'] ?? '/';
    $parts = parse_url($ref);
    $path = $parts['path'] ?? '/';
    header('Location: ' . $path . '?cerere=' . $state . '#oferta', true, 303);
    exit;
};

// Honeypot: boții completează câmpul ascuns → răspundem „ok" fără să trimitem nimic.
if (str_field($data['website'] ?? '', 200) !== '') {
    $isJson ? respond(200, ['ok' => true]) : $back('trimisa');
}

$lead = normalize_lead($data);
if ($lead === null) {
    $isJson ? respond(422, ['ok' => false, 'error' => 'invalid']) : $back('eroare');
}

$cfg = load_config();
$crm = false;
$email = false;
try {
    $crm = to_crm($lead, $cfg);
} catch (Throwable $e) {
    error_log('[lead] amoCRM: ' . $e->getMessage());
}
if (!$crm) {
    try {
        $email = to_email($lead, $cfg);
    } catch (Throwable $e) {
        error_log('[lead] e-mail: ' . $e->getMessage());
    }
}
if (!$crm && !$email) {
    error_log('[lead] PIERDUT, niciun canal funcțional: ' . str_replace("\n", ' | ', summary($lead)));
    $isJson ? respond(502, ['ok' => false, 'error' => 'delivery']) : $back('eroare');
}
$isJson ? respond(200, ['ok' => true, 'via' => $crm ? 'crm' : 'email']) : $back('trimisa');
