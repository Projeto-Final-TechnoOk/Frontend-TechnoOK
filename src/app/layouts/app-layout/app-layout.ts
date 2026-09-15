import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  imports: [NavbarComponent, RouterOutlet],
  selector: 'app-app-layout',
  styleUrl: './app-layout.css',
  templateUrl: './app-layout.html',
})
export class AppLayout {}
