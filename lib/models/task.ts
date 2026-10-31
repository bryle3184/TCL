import mongoose, { Schema, type Model } from "mongoose";

export interface TaskDocument {
  _id: mongoose.Types.ObjectId;
  task: string;
  deadline?: Date | string;
  live?: string;
  note?: string;
  assigned?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    task: { type: String, required: true, trim: true },
    deadline: { type: Date },
    live: { type: String, default: "" },
    note: { type: String, default: "" },
    assigned: { type: String, default: "" },
    role: { type: String, default: "" },
  },
  { collection: "todos", strict: false, timestamps: true },
);

export const Task: Model<TaskDocument> =
  (mongoose.models.Task as Model<TaskDocument>) ??
  mongoose.model<TaskDocument>("Task", TaskSchema);

export interface TaskArchiveDocument {
  _id: mongoose.Types.ObjectId;
  task: string;
  date?: Date | string;
  live?: string;
  status?: string;
  note?: string;
  assigned?: string;
  archivedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskArchiveSchema = new Schema<TaskArchiveDocument>(
  {
    task: { type: String, required: true, trim: true },
    date: { type: Date },
    live: { type: String, default: "" },
    status: { type: String, default: "Done" },
    note: { type: String, default: "" },
    assigned: { type: String, default: "" },
    archivedBy: { type: String, default: "" },
  },
  { collection: "task_archives", strict: false, timestamps: true },
);

export const TaskArchive: Model<TaskArchiveDocument> =
  (mongoose.models.TaskArchive as Model<TaskArchiveDocument>) ??
  mongoose.model<TaskArchiveDocument>("TaskArchive", TaskArchiveSchema);
