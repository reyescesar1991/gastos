import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMovement } from './add-movement';

describe('AddMovement', () => {
  let component: AddMovement;
  let fixture: ComponentFixture<AddMovement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMovement],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMovement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
