import { NextFunction, Request, Response } from 'express';

export type RestEndpoint = (req: Request, res: Response, next?: NextFunction) => Promise<any>;
export type SyncRestEndpoint = (req: Request, res: Response, next?: NextFunction) => any;
