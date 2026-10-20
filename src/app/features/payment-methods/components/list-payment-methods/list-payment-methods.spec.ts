import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPaymentMethods } from './list-payment-methods';

describe('ListPaymentMethods', () => {
  let component: ListPaymentMethods;
  let fixture: ComponentFixture<ListPaymentMethods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPaymentMethods],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPaymentMethods);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
