import { RequestHandler, Router } from 'express';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { VehicleController } from './vehicle.controller';
import { createVehicleSchema, updateVehicleSchema, vehicleIdSchema } from './vehicle.schemas';

// Every vehicle route needs a signed-in user; writes additionally need ADMIN.
export function vehicleRoutes(controller: VehicleController, authenticate: RequestHandler): Router {
  const router = Router();
  const admin = requireRole('ADMIN');
  const byId = validate({ params: vehicleIdSchema });

  router.use(authenticate);
  router.get('/', controller.list);
  router.post('/', admin, validate({ body: createVehicleSchema }), controller.create);
  router.get('/:id', byId, controller.get);
  router.put('/:id', admin, byId, validate({ body: updateVehicleSchema }), controller.update);
  router.delete('/:id', admin, byId, controller.remove);
  return router;
}
