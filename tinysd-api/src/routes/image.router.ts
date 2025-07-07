import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt = '',
      width = '512',
      height = '512',
      samples = '1',
      num_inference_steps = '30',
      guidance_scale = 7.5,
      scheduler = 'EulerAncestralDiscrete',
      seed = null,
    } = req.body;

    const response = await axios.post(
      'https://modelslab.com/api/v6/realtime/text2img',
      {
        key: 'hmW6iEQ1NbEFauqLjgONoWPZ8SILCwoHwiXlc5tmYejHVfK5i7s8VwLZaTfC',
        prompt,
        negative_prompt,
        width,
        height,
        samples,
        num_inference_steps,
        guidance_scale,
        scheduler,
        seed,
      },
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as imageRouter };
