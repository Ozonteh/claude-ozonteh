<?php
// Configurare pentru /api/lead.php pe hostingul cPanel.
// Copiați acest fișier ca „bull-config.php" ÎN AFARA folderului public, de exemplu:
//   /home/<utilizator-cpanel>/bull-config.php      (site-ul fiind în /home/<utilizator>/public_html/bull.ozonteh.md)
// Nu urcați niciodată tokenul în public_html.
return [
    // amoCRM: Setări → Integrări → Creează integrare privată → „Cheie de lungă durată" (long-lived token)
    'amocrm_base_url' => 'https://ozonteh.amocrm.ru',
    'amocrm_access_token' => '',
    'amocrm_pipeline_id' => 0,          // opțional: pâlnia de vânzări pentru BULL
    'amocrm_status_id' => 0,            // opțional: etapa inițială
    'amocrm_responsible_user_id' => 0,  // opțional: managerul responsabil

    // Alternativă la amoCRM: un webhook care primește lead-ul ca JSON (lăsați gol dacă folosiți amoCRM)
    'webhook_url' => '',

    // E-mail de rezervă (prin mail() din cPanel) dacă amoCRM nu răspunde
    'email_to' => 'marketing@ozonteh.md',
    // Expeditor: o adresă de pe domeniul găzduit pe același server (creați-o în cPanel → Email Accounts)
    'email_from' => 'BULL Moldova <noreply@bull.ozonteh.md>',
];
