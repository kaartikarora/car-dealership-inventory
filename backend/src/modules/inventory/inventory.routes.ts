import { RequestHandler, Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { vehicleIdSchema } from '../vehicles/vehicle.schemas';
import { InventoryController } from './inventory.controller';
import { restockSchema } from './inventory.schemas';

// Mounted under /api/vehicles alongside the vehicle routes.
export function inventoryRoutes(controller: InventoryController, authenticate: RequestHandler): Router {
  const router = Router();
  const byId = validate({ params: vehicleIdSchema });

  router.post('/:id/purchase', authenticate, byId, controller.purchase);
  router.post('/:id/restock', authenticate, requireRole('ADMIN'), byId, validate({ body: restockSchema }), controller.restock);
  return router;
}
