const express = require('express');

const router = express.Router();

// const fs = require('fs');

router.post('', async (req, res) => {
  // console.log(req.body);

  const result = { data: [], success: false, error: '' };

  // TODO: Add your code here.

  // result.data = data;
  result.success = true;
  res.send(result);
});
