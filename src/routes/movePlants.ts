import { Router } from "express";
import { getPlantGroup, updatePlantLocation } from "../notion-client/plantsTable.js";

const router = Router();

router.patch('/greenhouse/outside', async (_req, res) => {
    const greenHousePlants = await getPlantGroup('white greenhouse');
    greenHousePlants.forEach(p => updatePlantLocation(p.id, 'backyard'));
    res.status(200).send('moving plants outside!');
})

router.patch('/greenhouse/inside', async (_req, res) => {
    const greenHousePlants = await getPlantGroup('white greenhouse');
    greenHousePlants.forEach(p => updatePlantLocation(p.id, 'kitchen'));
    res.status(200).send('moving plants inside!');
})

export { router as movePlants }