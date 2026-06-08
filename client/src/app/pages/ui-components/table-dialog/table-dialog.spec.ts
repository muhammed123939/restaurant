import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDialog } from './table-dialog';

describe('TableDialog', () => {
  let component: TableDialog;
  let fixture: ComponentFixture<TableDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
