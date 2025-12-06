import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import axios from 'axios';
import EventCarousel from '../components/EventCarousel';
import Navbar from '../components/Navbar';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
}

const Inicio = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/eventos')
      .then(res => {
        if (Array.isArray(res.data)) {
          setEventos(res.data);
        } else {
          console.error('La respuesta de la API no es un array:', res.data);
          setEventos([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <Box bg="black" minH="100vh" overflow="hidden">
      {/* Navbar with search */}
      <Navbar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Fullscreen Event Carousel */}
      <EventCarousel 
        eventos={eventos}
        searchTerm={searchTerm}
      />
    </Box>
  );
};

export default Inicio;
