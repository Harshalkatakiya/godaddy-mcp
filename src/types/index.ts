export interface SingleDomainAvailabilitySuccessFields {
    available: boolean;
    currency?: string;
    definitive: boolean;
    domain: string;
    period?: number;
    price?: number;
}

export interface DomainAvailabilityErrorFields {
    code: string;
    message: string;
    path: string;
    pathRelated: string;
}

export interface CheckDomainAvailabilityError {
    code: string;
    fields?: DomainAvailabilityErrorFields[];
    message: string;
    retryAfterSec?: number;
}

export interface MultipleDomainAvailabilitySuccessFields {
    domains: SingleDomainAvailabilitySuccessFields[];
}

export interface MultipleDomainAvailabilityPartialError {
    code: string;
    domain: string;
    message?: string;
    path: string;
    status: number;
}

export interface MultipleDomainAvailabilityPartialErrorFields {
    domains: SingleDomainAvailabilitySuccessFields[];
    errors: MultipleDomainAvailabilityPartialError[];
}