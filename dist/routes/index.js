"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const parent_routes_1 = __importDefault(require("./parent.routes"));
const schoolDiscovery_routes_1 = __importDefault(require("./schoolDiscovery.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const vendor_routes_1 = __importDefault(require("./vendor.routes"));
const school_routes_1 = __importDefault(require("./school.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/parent', parent_routes_1.default);
router.use('/schools', schoolDiscovery_routes_1.default);
router.use('/cart', cart_routes_1.default);
router.use('/vendor', vendor_routes_1.default);
router.use('/school', school_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/settings', settings_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map