const Icon = ({ name, size = 16, className = '', style = {} }) => {
  const s = size, sw = 1.6;
  const P = (path) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}>{path}</svg>
  );
  const I = {
    home:       <><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></>,
    folder:     <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></>,
    file:       <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>,
    check:      <path d="M5 12l4 4L19 7"/>,
    checkCircle:<><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></>,
    x:          <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
    plus:       <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    search:     <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    bell:       <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    users:      <><circle cx="9" cy="8" r="4"/><path d="M3 21v-1a6 6 0 0 1 12 0v1"/><circle cx="17" cy="7" r="3"/><path d="M22 21v-1a5 5 0 0 0-4-4.9"/></>,
    lock:       <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    unlock:     <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7-3"/></>,
    eye:        <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    download:   <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>,
    upload:     <><path d="M12 20V8"/><path d="m7 13 5-5 5 5"/><path d="M5 4h14"/></>,
    share:      <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4"/><path d="m8 13 8 4"/></>,
    history:    <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>,
    star:       <path d="m12 3 2.6 5.5 6 .9-4.3 4.3 1 6L12 17l-5.3 2.7 1-6-4.3-4.3 6-.9z"/>,
    more:       <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    chevR:      <path d="m9 6 6 6-6 6"/>,
    chevL:      <path d="m15 6-6 6 6 6"/>,
    chevD:      <path d="m6 9 6 6 6-6"/>,
    arrowR:     <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    layers:     <><path d="M12 2 2 7l10 5 10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></>,
    shield:     <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>,
    grid:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    list:       <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>,
    sparkles:   <><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m6 18 2.5-2.5"/><path d="m15.5 8.5 2.5-2.5"/></>,
    filter:     <path d="M3 5h18l-7 8v6l-4 2v-8z"/>,
    clock:      <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar:   <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    sig:        <><path d="M3 17c4 0 4-10 7-10s3 8 7 8 4-4 4-4"/><path d="M3 21h18"/></>,
    bolt:       <path d="m13 2-8 12h6l-1 8 8-12h-6z"/>,
    msg:        <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3Z"/>,
    info:       <><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="8" r=".6" fill="currentColor"/></>,
    warn:       <><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></>,
    user:       <><circle cx="12" cy="9" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    archive:    <><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></>,
    edit:       <><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
    cmd:        <path d="M9 6a3 3 0 1 0-3 3h3V6Zm0 0v12m0 0a3 3 0 1 0 3-3M9 18h3m0 0V6m0 0a3 3 0 1 0 3 3m0 0V6m0 3h3a3 3 0 1 0-3-3m0 12a3 3 0 1 0 3-3h-3v3Z"/>,
    refresh:    <><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></>,
    link:       <><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1"/></>,
    tag:        <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></>,
    sun:        <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></>,
    play:       <path d="M6 4v16l14-8z"/>,
    book:       <path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2zm2 13h14"/>,
    paperclip:  <path d="m21 11-9 9a5 5 0 0 1-7-7L13 5a3 3 0 0 1 4 4L9 17a1.5 1.5 0 0 1-2-2l7-7"/>,
    send:       <><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="m22 2-11 11"/>,</>,
    validate:   <path d="M5 12l4 4L19 7"/>,
    comment:    <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3Z"/>,
    restore:    <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
    sign:       <><path d="M3 17c4 0 4-10 7-10s3 8 7 8 4-4 4-4"/><path d="M3 21h18"/></>,
  };
  return P(I[name] || <circle cx="12" cy="12" r="3"/>);
};

export default Icon;
