export function usePrint() {
  const openPrintWindow = (htmlOrUrl: string, useUrl = true, opts = 'width=400,height=600') => {
    // If useUrl=true we open the URL directly (server returns printable HTML)
    // If useUrl=false we open a window and write the HTML string
    const win = window.open('', '_blank', opts);
    if (!win) {
      alert('Popup blocked. Allow popups for this site to print.');
      return;
    }

    if (useUrl) {
      // navigate to URL; we must write location to the opened window to stay on same tab
      win.location.href = htmlOrUrl;
    } else {
      win.document.write(htmlOrUrl);
      win.document.close();
    }
  };

  return { openPrintWindow };
}
