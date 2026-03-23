import express from 'express';
import * as classRefRepo from '../repos/class_reference.repo.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const classes = await classRefRepo.findAllClassReferences();
        res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const classRef = await classRefRepo.findClassReferenceById(id);

        if (!classRef) {
            return res.status(404).json({
                error: 'Class not found',
                message: `Class with ID ${id} not found`
            });
        }

        res.json(classRef);
    } catch (error) {
        console.error('Error fetching class:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

export default router;
