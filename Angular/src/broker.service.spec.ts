import { TestBed, inject } from '@angular/core/testing';

import { BrokerService } from './broker.service';

describe('BrokerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrokerService]
    });
  });

  it('should be created', inject([BrokerService], (service: BrokerService) => {
    expect(service).toBeTruthy();
  }));
});
