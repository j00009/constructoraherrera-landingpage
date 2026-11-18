import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../layout/navbar/navbar';
import { FooterComponent } from '../../../../layout/footer/footer';
import { WhatsappFabComponent } from '../../../../layout/whatsapp-fab/whatsapp-fab';
import { HeroCarouselComponent } from '../../hero-carousel/hero-carousel';
import { AboutComponent } from '../../about/about';
import { ContactFormComponent } from '../../contact-form/contact-form';
import { ProjectGalleryComponent } from '../../project-gallery/project-gallery';

@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, FooterComponent, WhatsappFabComponent, HeroCarouselComponent, AboutComponent, ProjectGalleryComponent, ContactFormComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePageComponent {}
