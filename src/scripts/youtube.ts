// Facade YouTube: posterul e auto-găzduit, iframe-ul youtube-nocookie se creează doar la click pe Play.
export function initYouTube(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-yt]').forEach((frame) => {
    frame.querySelector('button')?.addEventListener('click', () => {
      const id = frame.dataset.yt!;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = frame.dataset.ytTitle ?? 'YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.className = 'video-iframe';
      frame.replaceChildren(iframe);
      iframe.focus();
    });
  });
}
