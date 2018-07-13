export const global = (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || this;

export const document = global.document || {};
