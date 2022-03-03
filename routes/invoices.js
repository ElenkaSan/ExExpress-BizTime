const db = require("../db");
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
   try{
    const result = await db.query(`SELECT id, comp_code FROM invoices`);
    let invs = result.rows;
    return res.json( {'invoices': invs} );
 }
 catch (e) {
   return next(e);
 }
});
 
 router.get('/:id', async (req, res, next) => {
    try {
       const { id } = req.params;
       const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
       if(result.rows.length === 0) {
          throw new ExpressError(`There is no invoice with the id: ${ id }`, 404)
       }
       let invs = result.rows;
       return res.json({'invoices': invs})
    } catch(e) {
       return next(e);
    }
 })
 
 router.post('/', async (req, res, next) => {
    try {
       const { comp_code, amt } = req.body;
       const results = await db.query(`
       INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2) 
       RETURNING id, comp_code, amt, paid, add_date, paid_date
       `, [comp_code, amt]);
       return res.json({'invoices': results.rows[0]});
    } catch(e) {
       return next(e);
    }
 })
 
 router.put('/:id', async (req, res, next) => {
    try {
       const { amt, paid } = req.body;
       const { id } = req.params;
       const results = await db.query(`
       UPDATE invoices SET amt = $1, paid = $2 
       WHERE id = $3 
       RETURNING id, amt, paid
       `, [amt, paid, id]);
       if(results.rows.length === 0) {
          throw new ExpressError(`There is no invoice with the id: ${ id }`, 404)
       }
       return res.json({'invoices': results.rows[0]})
    } catch(e) {
       return next(e);
    }
 })
 
 router.delete('/:id', async (req, res, next) => {
    try {
       const { id } = req.params;
       const results = await db.query(`
       DELETE FROM invoices
       WHERE id = $1`, [id]);
       return res.json({ message: "Deleted" });
    } catch(e) {
       return next(e);
    }
 })
 

module.exports = router;