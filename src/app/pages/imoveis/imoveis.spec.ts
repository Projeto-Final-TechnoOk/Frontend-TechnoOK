import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImoveisPage } from './imoveis';

describe('Imoveis', () => {
  let component: ImoveisPage;
  let fixture: ComponentFixture<ImoveisPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImoveisPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ImoveisPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
