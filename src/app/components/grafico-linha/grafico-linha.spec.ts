import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraficoLinha } from './grafico-linha';

describe('GraficoLinha', () => {
  let component: GraficoLinha;
  let fixture: ComponentFixture<GraficoLinha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoLinha],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficoLinha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
