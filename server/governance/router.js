const express=require('express'); const {sequelize}=require('../models'); const auth=require('../middleware/auth');
const {createWorkflow}=require('./workflowCore'); const {createGovernedRouter}=require('./routerFactory');
const query=async(s,p,t)=>{const [rows]=await sequelize.query(s,{bind:p,transaction:t});return Array.isArray(rows)?rows:[];};
const db={query:(s,p)=>query(s,p),transaction:work=>sequelize.transaction(t=>work((s,p)=>query(s,p,t)))};
module.exports=createGovernedRouter({express,workflow:createWorkflow(require('./config')),auth,db});
