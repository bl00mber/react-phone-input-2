import React from 'react';
import {createPortal} from 'react-dom';
import {DROPDOWN_ID} from "./index";

const PortalWrapper = ({
                         children,
                         coords,
                         dropdownContainerClass = '',
                         dropdownContainerStyle,
                       }) => {

  const style = {
    'position': `absolute`,
    'width': `auto`,
    'top': `${coords.top}px`,
    'left': `${coords.left}px`,
    ...dropdownContainerStyle
  };

  return (
    <div id={DROPDOWN_ID} className={`react-tel-input ${dropdownContainerClass}`.trim()} style={style}>{children}</div>
  );
}


const Portal = ({
                  children,
                  dropdownContainerId,
                  enableSearch,
                  ...otherProps
                }) => {
  return createPortal(
    <PortalWrapper {...otherProps}>{children}</PortalWrapper>, dropdownContainerId && document.getElementById(dropdownContainerId) || document.body)
};

export default Portal;
