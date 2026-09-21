import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FallingItem } from '../../models/falling-item.model';
@Component({ selector: 'app-falling-item', template: `<span class="item" [class.danger]="item().dangerous" [style.left.%]="item().x" [style.top.%]="item().y" [style.transform]="'translate(-50%, -50%) rotate(' + item().rotation + 'deg)'"><i [class]="'sprite ' + item().kind"></i></span>`, styleUrl: './falling-item.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class FallingItemComponent { readonly item = input.required<FallingItem>(); }
