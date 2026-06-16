import { Router } from 'express';
import authRoutes from './auth.routes';
import parentRoutes from './parent.routes';
import schoolDiscoveryRoutes from './schoolDiscovery.routes';
import cartRoutes from './cart.routes';
import vendorRoutes from './vendor.routes';
import schoolRoutes from './school.routes';
import adminRoutes from './admin.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/parent', parentRoutes);
router.use('/schools', schoolDiscoveryRoutes);
router.use('/cart', cartRoutes);
router.use('/vendor', vendorRoutes);
router.use('/school', schoolRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);

export default router;
