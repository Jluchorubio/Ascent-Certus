"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate6DigitCode = void 0;
const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generate6DigitCode = generate6DigitCode;
