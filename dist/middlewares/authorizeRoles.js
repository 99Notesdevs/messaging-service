"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        const type = req === null || req === void 0 ? void 0 : req.authType;
        if (!type || !allowedRoles.includes(type)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        else {
            next();
        }
    };
};
exports.authorizeRoles = authorizeRoles;
