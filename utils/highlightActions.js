// utils/highlightActions.js

async function highlightElement(elementHandle) {
  if (!elementHandle) return;
  try {
    await elementHandle.evaluate((el) => {
      el.__origTransition = el.style.transition || "";
      el.style.transition = "background-color 0.3s ease, border 0.3s ease";
      el.style.border = "2px solid Red";
      el.style.backgroundColor = "#eccdcaff";
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        el.style.border = "";
        el.style.backgroundColor = "";
        el.style.transition = el.__origTransition || "";
      }, 900);
    });
  } catch { }
}

export function enableAutoHighlight(page) {
  if (!page) throw new Error("enableAutoHighlight(page) requires a Playwright page instance");

  const sampleLocator = page.locator("body");
  const proto = Object.getPrototypeOf(sampleLocator);
  if (proto.__autoHighlightPatched) return;
  proto.__autoHighlightPatched = true;

  const originalClick = proto.click;
  const originalFill = proto.fill;
  const originalType = proto.type;
  const originalCheck = proto.check;
  const originalUncheck = proto.uncheck;
  const originalSelectOption = proto.selectOption;
  const originalHover = proto.hover;
  const originalPress = proto.press;
  const originalDragTo = proto.dragTo;

proto.click = async function (...args) {
  const handle = await this.elementHandle().catch(() => null);

  if (!handle) {
    console.warn("HighlightWrapper: Element not found, skipping click.");
    return; // *** prevent Playwright from clicking a non-existing element ***
  }

  await highlightElement(handle);
  return originalClick.apply(this, args);
};

  proto.fill = async function (...args) {
    const handle = await this.elementHandle().catch(() => null);
    if (handle) await highlightElement(handle);
    return originalFill.apply(this, args);
  };

  proto.type = async function (...args) {
    console.log(`[Playwright Action] Type "${args[0]}" →`, this.toString());
    return await originalType.apply(this, args);
  };


  proto.check = async function (...args) {
    console.log(`[Playwright Action] Check →`, this.toString());
    return await originalCheck.apply(this, args);
  };


  proto.uncheck = async function (...args) {
    console.log(`[Playwright Action] Uncheck →`, this.toString());
    return await originalUncheck.apply(this, args);
  };


  proto.selectOption = async function (...args) {
    const handle = await this.elementHandle().catch(() => null);
    if (handle) await highlightElement(handle);
    return originalSelectOption.apply(this, args);
  };

  proto.hover = async function (...args) {
    console.log(`[Playwright Action] Hover →`, this.toString());
    return await originalHover.apply(this, args);
  };

  proto.press = async function (...args) {
    console.log(`[Playwright Action] Press "${args[0]}" →`, this.toString());
    return await originalPress.apply(this, args);
  };

  proto.dragTo = async function (...args) {
    console.log(`[Playwright Action] DragTo →`, this.toString());
    return await originalDragTo.apply(this, args);
  };





  // ✅ Fixed: use the saved original `type`, not internal keyboard
  if (originalType) {
    proto.type = async function (...args) {
      const handle = await this.elementHandle().catch(() => null);
      if (handle) await highlightElement(handle);
      return originalType.apply(this, args);
    };
  }
}