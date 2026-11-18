import { Component } from '@angular/core';
import { ProyectoImagen } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-project-gallery',
  templateUrl: './project-gallery.html',
  styleUrl: './project-gallery.css'
})
export class ProjectGalleryComponent {
  readonly proyectos: ProyectoImagen[] = [
    { src: '/img/obra/1794955754343.jpg', alt: 'Radier de hormigón en proceso de ejecución', descripcion: 'Radier y fundaciones', categoria: 'Obra' },
    { src: '/img/obra/techumbre1.webp', alt: 'Cubierta metálica instalada en una construcción', descripcion: 'Tabiquería exterior', categoria: 'Obra' },
    { src: '/img/obra/techumbre2.jpeg', alt: 'Estructura de techumbre de madera en una vivienda', descripcion: 'Estructura de tabiquería', categoria: 'Obra' },
    { src: '/img/obra/WhatsApp%20Image%202026-11-15%20at%2015.28.37.jpeg', alt: 'Edificio de varios pisos en etapa de construcción', descripcion: 'Edificación en obra', categoria: 'Obra' },
    { src: '/img/remodelaciones/1794955754326.jpg', alt: 'Pasillo interior con piso nuevo tipo madera', descripcion: 'Renovación de interiores', categoria: 'Remodelación' },
    { src: '/img/remodelaciones/1794955754334.jpg', alt: 'Pasillo terminado con ventanas y revestimientos', descripcion: 'Terminaciones interiores', categoria: 'Remodelación' },
    { src: '/img/varios/1794955754350.jpg', alt: 'Vivienda en construcción con entramado de madera y techumbre', descripcion: 'Construcción de vivienda', categoria: 'Otros trabajos' },
    { src: '/img/varios/WhatsApp%20Image%202026-11-15%20at%2015.28.34.jpeg', alt: 'Tabiquería metálica instalada en una obra interior', descripcion: 'Tabiquería departamental', categoria: 'Otros trabajos' }
  ];
}
