/**
 * 
 * Required External Modules and Interfaces
 * 
 */

import express, { Request, Response } from "express";
import * as ItemService from "./items.service";
import { BaseItem, Item } from "./item.interface";
import { checkJwt } from "../middleware/authz.middleware";
import { checkPermissions } from "../middleware/permissions.middleware";
import { ItemPermission } from "./item-permission";

/**
 * 
 * 
 * Router Definition
 * 
 */

export const itemRouter = express.Router();

/**
 * 
 * 
 * Controller Definitions
 * 
 */

// GET items
itemRouter.get("/", async (req: Request, res: Response) => {
  try {
    const items: Item[] = await ItemService.findAll();

    res.status(200).send(items);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send(e.message);
    }
    
    res.status(500).send(e);
  }
});

// GET items/:id
itemRouter.get("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  try {
    const item: Item = await ItemService.find(id);

    if (item) {
      res.status(200).send(item);
    }

    res.status(404).send("item not found");
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send(e.message);
    }

    res.status(500).send(e);
  }
});

// Authorization middleware
itemRouter.use(checkJwt);

// POST items
itemRouter.post("/", checkPermissions(ItemPermission.CreateItems), async (req: Request, res: Response) => {
  try {
    const item: BaseItem = req.body;
    const newItem: Item = await ItemService.create(item);

    res.status(201).json(newItem);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send(e.message);
    }

    res.status(500).send(e);
  }
});

// PUT items/:id
itemRouter.put("/:id", checkPermissions(ItemPermission.UpdateItems), async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  try {
    const itemUpdate: Item = req.body;

    const existingItem: Item = await ItemService.find(id);

    if (existingItem) {
      const newItem = await ItemService.update(id, itemUpdate);
      res.status(200).json(newItem);
    }

    const newItem = await ItemService.create(itemUpdate);
    res.status(201).json(newItem);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send(e.message);
    }

    res.status(500).send(e);
  }
});

// DELETE items/:id
itemRouter.delete("/:id", checkPermissions(ItemPermission.DeleteItems), async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    await ItemService.remove(id);

    res.sendStatus(204);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send(e.message);
    }

    res.status(500).send(e);
  }
});