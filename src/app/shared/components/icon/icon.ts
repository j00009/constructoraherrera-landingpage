import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css'
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly ariaHidden = input(true, { transform: (value: boolean | '') => value !== false && value !== '' });
}
