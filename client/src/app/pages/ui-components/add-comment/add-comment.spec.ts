import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComment } from './add-comment';

describe('AddComment', () => {
  let component: AddComment;
  let fixture: ComponentFixture<AddComment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddComment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddComment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
