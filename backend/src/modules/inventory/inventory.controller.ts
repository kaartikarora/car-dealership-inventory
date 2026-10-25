import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';

type IdParams = { id: string };

export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  purchase = async (req: Request<IdParams>, res: Response) => {
    res.json(await this.inventory.purchase(req.params.id));
  };

  restock = async (req: Request<IdParams>, res: Response) => {
    res.json(await this.inventory.restock(req.params.id, req.body.amount));
  };
}
