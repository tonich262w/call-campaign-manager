const mongoose = require ( 'mongoose');
const connectB = async ( =>
try i
const conn = await
mongoose.connect(process. env. MON-
GODB_URI, {
useNewUrlParser: true, useUnifiedTopology: true,
3) ;
console. 10g ( MongoDB
Conectado: ${conn.connection.host}
*);
} catch (error) ‹
console.error ( 'Error: $ {error.message}*);
process. exit (1);
}
module. exports = connectB;