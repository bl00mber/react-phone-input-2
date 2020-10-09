import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DROPDOWN_ID } from "./index";

const Portal = ({dropdownContainerId, dropdownContainerClass = '', dropdownContainerStyle, coords, children}) => {
  let mount = document.getElementById(dropdownContainerId);
  if (!mount) {
    mount = document.body;
  }
  const el = document.createElement("div");
  el.id = DROPDOWN_ID;
  el.className = `react-tel-input ${dropdownContainerClass}`.trim();
  if (dropdownContainerStyle) {
    Object.keys(dropdownContainerStyle).map(key => el.style.setProperty(key, dropdownContainerStyle[key]));
  }
  el.style.setProperty('position',`absolute`);
  el.style.setProperty('width', `auto`);
  el.style.setProperty('top', `${coords.top}px`);
  el.style.setProperty('left', `${coords.left}px`);

  useEffect(() => {
    mount.appendChild(el);
    return () => mount.removeChild(el);
  }, [el, mount]);

  return createPortal(children, el)
};

export default Portal;
