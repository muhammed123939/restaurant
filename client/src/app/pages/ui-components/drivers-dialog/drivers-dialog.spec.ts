import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversDialog } from './drivers-dialog';

describe('DriversDialog', () => {
  let component: DriversDialog;
  let fixture: ComponentFixture<DriversDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
