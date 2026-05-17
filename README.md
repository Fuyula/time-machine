# Tab time machine

Extension to save tabs and scrolling position.

> _Note: Pages that require authentication might not recover the original view, this depends on how authentication is handled by the browser and the specific domain._

## Browser differences

- **Firefox:** Internal pages (`about:, moz-extension://`) are excluded, because Firefox API doesn't allow to reopen them.
- **Chrome:** All pages are saved.

## Stack

- **Base:** React + Vite
- **Styling:** Tailwindcss
- **Components:** Shadcn
- **Icons:** Lucide react

## How to run it locally

### Requirements

- Node.js 22 or later (LTS recommended)
- A Chromium-based browser (Chrome, Brave, etc.) or Firefox 120+

### Instructions

1. Fork this repository and install its dependencies

   ```bash
   npm install
   ```

2. Build the project
   ```bash
   npm run build
   ```

### Chrome

3. Go to `chrome://extensions/` in your Chrome browser (or `[browser]://extensions/` if using another Chromium-based browser).
4. Enable the `Developer mode`.
5. Press the `Load unpacked` button and select the `dist` folder.

### Firefox

3. Go to `about:debugging` and then to `This Firefox`.
4. Press the `Load Temporary Add-on...` and select the `manifest.json` in your `dist` folder.

The extension should be ready to use in the extensions section.

## License

This repository has a MIT License. Do whatever you want, just don't sue me if it breaks ;)
