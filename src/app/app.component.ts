import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet],
})
export class AppComponent {}
