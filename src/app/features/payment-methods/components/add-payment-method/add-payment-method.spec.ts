import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPaymentMethod } from './add-payment-method';

describe('AddPaymentMethod', () => {
  let component: AddPaymentMethod;
  let fixture: ComponentFixture<AddPaymentMethod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPaymentMethod],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPaymentMethod);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
