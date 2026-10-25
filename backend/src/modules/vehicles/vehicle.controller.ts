import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

type IdParams = { id: string };

export class VehicleController {
  constructor(private readonly vehicles: VehicleService) {}

  list = async (_req: Request, res: Response) => {
    res.json(await this.vehicles.list());
  };

  search = async (req: Request, res: Response) => {
    res.json(await this.vehicles.search(req.query as never));
  };

  get = async (req: Request<IdParams>, res: Response) => {
    res.json(await this.vehicles.get(req.params.id));
  };

  create = async (req: Request, res: Response) => {
    res.status(201).json(await this.vehicles.create(req.body));
  };

  update = async (req: Request<IdParams>, res: Response) => {
    res.json(await this.vehicles.update(req.params.id, req.body));
  };

  remove = async (req: Request<IdParams>, res: Response) => {
    await this.vehicles.remove(req.params.id);
    res.status(204).end();
  };
}
