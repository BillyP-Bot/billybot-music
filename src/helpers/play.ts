import { Client } from "discord.js";
import DisTubeClient from "distube";
import { Video } from "youtube-sr";

import { IDisTube } from "@types";

export class Queue<T = any> {
	private items: T[];
	constructor() {
		this.clear();
	}
	public clear() {
		this.items = [];
	}
	public enqueue(item: T) {
		this.items.push(item);
	}
	public dequeue() {
		this.items.shift();
	}
	public front() {
		return this.items[0];
	}
	public length() {
		return this.items.length;
	}
	public list() {
		return this.items;
	}
}

export class QueueManager<T = any> {
	private queuesByKey: Record<string, Queue<T>>;
	constructor() {
		this.queuesByKey = {};
	}
	public initIfUndefined(key: string) {
		if (!this.queuesByKey[key]) this.queuesByKey[key] = new Queue<T>();
	}
	public clear(key: string) {
		if (this.queuesByKey[key]) delete this.queuesByKey[key];
	}
	public enqueue(item: T, key: string) {
		this.initIfUndefined(key);
		return this.queuesByKey[key]?.enqueue(item);
	}
	public dequeue(key: string) {
		return this.queuesByKey[key]?.dequeue();
	}
	public front(key: string) {
		return this.queuesByKey[key]?.front();
	}
	public length(key: string) {
		this.initIfUndefined(key);
		return this.queuesByKey[key]?.length();
	}
	public list(key: string) {
		return this.queuesByKey[key]?.list();
	}
}

export const DisTube: IDisTube = {
	client: null,
	queue: new QueueManager<Video>()
};

export const initDisTubeClient = (client: Client) => {
	if (!DisTube.client) DisTube.client = new DisTubeClient(client, { leaveOnStop: false });
};
