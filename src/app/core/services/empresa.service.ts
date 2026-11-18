import { Injectable, signal } from '@angular/core';
import { Empresa } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  readonly empresa = signal<Empresa>({
    nombre: 'Constructora Herrera',
    eslogan: 'Construcción y remodelación',
    telefono: '+56 9 4983 8375',
    telefonoVisible: '+56 9 4983 8375',
    correo: 'tonex63@gmail.com',
    whatsapp: '56949838375',
    horario: 'Lunes a viernes, 9:00 a 18:00',
    cobertura: 'Obras en toda la Región del Maule',
    redes: {
      whatsapp: 'https://wa.me/56949838375',
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/profile.php?id=61583712547631/',
      linkedin: 'https://www.linkedin.com/'
    }
  });
}
