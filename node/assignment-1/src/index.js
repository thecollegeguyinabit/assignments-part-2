import express from 'express';
import path from 'path';
import { sequelize } from '../config/db.js';
import courseRoutes from './routes/courses.js';

const PORT = process.env.PORT;

const app = express();
//set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

//set middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//enable to host static files
app.use(express.static('public'));


try {
  await sequelize.authenticate();
  console.log('Database synced successfully.');
} catch (error) {
  console.error('Unable to sync database:', error);
}

app.use("/", courseRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});