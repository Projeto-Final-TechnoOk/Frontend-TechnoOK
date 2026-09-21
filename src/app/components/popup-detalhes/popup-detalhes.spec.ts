import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupDetalhes } from './popup-detalhes';

describe('PopupDetalhes', () => {
  let component: PopupDetalhes;
  let fixture: ComponentFixture<PopupDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
