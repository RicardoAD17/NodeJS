const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

const serviceAccount = require('./firebase-key.json');

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gymbd-386cc.firebaseio.com' // opcional si solo usas Firestore
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gymmylopez2808@gmail.com',
    pass: 'muzz uuih whpp mcjk' // Usa contraseña de aplicación si es Gmail
  }
});

// Ruta que devuelve datos reales desde Firestore para el QR
app.get('/api/qr-data-correo/:correo', async (req, res) => {
  const correo = req.params.correo;

  try {
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('correo', '==', correo).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const doc = snapshot.docs[0];
    const datos = doc.data();
    datos.timestamp = new Date().toISOString();

    res.json(datos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar los datos' });
  }
});



// Ruta para enviar correo
app.post('/api/enviar-correo', (req, res) => {
  const { correoDestino, asunto, mensaje } = req.body;

  if (!correoDestino || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const mailOptions = {
    from: 'gymmylopez2808@gmail.com',
    to: correoDestino,
    subject: asunto,
    text: mensaje
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar correo:', error);
      return res.status(500).json({ error: 'Error al enviar el correo' });
    }
    res.json({ ok: true, mensaje: 'Correo enviado correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
// Obtener todas las suscripciones
app.get('/api/suscripciones', async (req, res) => {
   try {
    const snapshot = await db.collection('formularioSuscripcion').get();
    
    console.log('Cantidad de documentos suscripcion:', snapshot.size);

    const suscripciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(suscripciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener suscripcion' });
  }
});


// Obtener todas las quejas
app.get('/api/quejas', async (req, res) => {
  try {
    const snapshot = await db.collection('formularioQueja').get();
    
    console.log('Cantidad de documentos quejas:', snapshot.size);  // Revisa si encuentra datos

    const quejas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(quejas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener quejas' });
  }
});

app.delete('/api/suscripciones/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.collection('formularioSuscripcion').doc(id).delete();
    res.json({ ok: true, mensaje: 'Suscripción eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la suscripción' });
  }
});
app.delete('/api/quejas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.collection('formularioQueja').doc(id).delete();
    res.json({ ok: true, mensaje: 'Queja eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la suscripción' });
  }
});
app.put('/api/suscripciones/:id', async (req, res) => {
  const id = req.params.id;
  const nuevosDatos = req.body;

  try {
    await db.collection('formularioSuscripcion').doc(id).update(nuevosDatos);
    res.json({ ok: true, mensaje: 'Suscripción actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la suscripción' });
  }
});
app.put('/api/quejas/:id', async (req, res) => {
  const id = req.params.id;
  const nuevosDatos = req.body;

  try {
    await db.collection('formularioQueja').doc(id).update(nuevosDatos);
    res.json({ ok: true, mensaje: 'Queja actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la queja' });
  }
});

