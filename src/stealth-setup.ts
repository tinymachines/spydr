import { Page } from 'playwright';

export async function addStealthScripts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // Mock plugins with realistic data
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        {
          0: {
            type: "application/x-google-chrome-pdf",
            suffixes: "pdf",
            description: "Portable Document Format",
            enabledPlugin: null
          },
          description: "Portable Document Format",
          filename: "internal-pdf-viewer",
          length: 1,
          name: "Chrome PDF Plugin"
        },
        {
          0: {
            type: "application/x-nacl",
            suffixes: "",
            description: "Native Client Executable",
            enabledPlugin: null
          },
          description: "Native Client Executable",
          filename: "internal-nacl-plugin",
          length: 2,
          name: "Chrome PDF Viewer"
        }
      ],
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Mock permissions API
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission } as PermissionStatus) :
        originalQuery(parameters)
    );

    // Hide automation indicators
    Object.defineProperty(navigator, 'maxTouchPoints', {
      get: () => 1,
    });

    // Mock chrome object
    (window as any).chrome = {
      runtime: {},
      loadTimes: () => ({}),
      csi: () => ({}),
      app: {}
    };

    // Override getParameter to hide WebGL renderer info
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // UNMASKED_VENDOR_WEBGL
      if (parameter === 37445) {
        return 'Intel Inc.';
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
      }
      return getParameter.call(this, parameter);
    };

    // Mock battery API
    Object.defineProperty(navigator, 'battery', {
      get: () => undefined,
    });

    // Mock connection API
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        rtt: 100,
        downlink: 2
      }),
    });

    // Override Date.getTimezoneOffset
    Date.prototype.getTimezoneOffset = function() {
      return -300; // EST timezone
    };

    // Mock media devices
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
      value: () => Promise.resolve([
        { deviceId: 'default', kind: 'audioinput', label: 'Default - Microphone (Built-in)', groupId: 'group1' },
        { deviceId: 'default', kind: 'audiooutput', label: 'Default - Speaker (Built-in)', groupId: 'group1' },
        { deviceId: 'default', kind: 'videoinput', label: 'FaceTime HD Camera (Built-in)', groupId: 'group2' }
      ])
    });

    // Remove automation-related properties
    delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array;
    delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise;
    delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
  });
}