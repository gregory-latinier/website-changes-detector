// urls-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations';
import { Model, Mongoose } from 'mongoose';

export interface IUrl {
  _id: string;
  url: string;
  lastAlert: Date;
  lastCheck: Date;
  frequency: number;
  frequencyUnit: number;
  active: boolean;
}

export default function (app: Application): Model<any> {
  const modelName = 'urls';
  const mongooseClient: Mongoose = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    url: { type: String, required: true },
    lastAlert: { type: Date },
    lastCheck: { type: Date },
    frequency: { type: Number, required: true },
    frequencyUnit: { type: Number, required: true },
    active: { type: Boolean, required: true, default: false }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    (mongooseClient as any).deleteModel(modelName);
  }
  return mongooseClient.model<any>(modelName, schema);
}
