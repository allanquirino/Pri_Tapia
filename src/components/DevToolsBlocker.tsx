import { useEffect } from "react";

const DevToolsBlocker = () => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable key combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (Developer Tools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+A (Select All) - Optional
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+P (Print) - Optional
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+F (Find) - Optional
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+K (Firefox Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === "K") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+O (Firefox View Source)
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        return false;
      }

      // Block Alt+Tab (Window switching) - Optional
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+Delete (Clear Browser Data)
      if (e.ctrlKey && e.shiftKey && e.key === "Delete") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Alt+Del (System)
      if (e.ctrlKey && e.altKey && e.key === "Delete") {
        e.preventDefault();
        return false;
      }

      // Block Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect DevTools opening
    const devtools = { open: false };
    const threshold = 160;
    
    const checkDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          console.clear();
          console.log(
            "%cDesenvolvedor detectado!",
            "color: red; font-size: 30px; font-weight: bold;"
          );
          // Optionally redirect or show warning
          // window.location.href = "/";
        }
      } else {
        devtools.open = false;
      }
    };

    // Event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);
    
    // Check for DevTools periodically
    const devToolsInterval = setInterval(checkDevTools, 500);

    // Clean up
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(devToolsInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default DevToolsBlocker;