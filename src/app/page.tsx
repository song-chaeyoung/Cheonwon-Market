import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-[100svh] bg-background">
      <section className="mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col justify-between px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
        <header className="flex items-start gap-3 border-b pb-4 sm:items-center sm:pb-5">
          <Image
            src="/brand/cheonwon-mark.svg"
            alt=""
            width={44}
            height={33}
            className="mt-0.5 shrink-0 sm:mt-0 sm:h-9 sm:w-12"
            unoptimized
          />
          <div className="min-w-0 space-y-1">
            <p className="text-base font-bold tracking-normal sm:text-lg">
              천원마켓
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              공짜부터 천원까지, 가볍게 예약
            </p>
          </div>
        </header>

        <div className="grid flex-1 place-items-center py-10 sm:py-16">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-6 inline-flex rounded-lg border bg-card p-3 shadow-sm sm:mb-8 sm:p-4">
              <Image
                src="/brand/cheonwon-mark.svg"
                alt="천원마켓"
                width={72}
                height={54}
                className="sm:h-[66px] sm:w-[88px]"
                unoptimized
                priority
              />
            </div>
            <p className="text-sm font-semibold text-primary">
              잠시 쉬어갑니다
            </p>
            <h1 className="mx-auto mt-4 max-w-[12ch] text-3xl font-bold leading-tight tracking-normal text-foreground sm:max-w-none sm:text-5xl">
              다음 만남까지 잠시 닫아둡니다.
            </h1>
          </div>
        </div>

        <footer className="border-t pt-4 text-center text-sm font-medium text-muted-foreground sm:pt-5 sm:text-left">
          천원마켓
        </footer>
      </section>
    </main>
  );
}
