import { sign } from '@/hooks/jwt';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // eslint-disable-next-line no-unused-vars
  const body = await req.json();

  // const token = await getToken({
  //   req,
  // });
  // console.log('token', token);
  const session = await auth();

  console.log("Session")
  // console.log(session);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const credentials = {
    userId: user!.id!,
    email: user!.email!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiKey: (user as any).apiKey || "" as string,
  }
  // console.log({ query, metadata, number, is_pro, query_id, user_id, conversation_id })

  const jwt = sign(credentials);
  const url = process.env.INFERENCE_SERVER_URL + '/query/stream';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'An error occurred' }, { status: response.status });
  }
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}