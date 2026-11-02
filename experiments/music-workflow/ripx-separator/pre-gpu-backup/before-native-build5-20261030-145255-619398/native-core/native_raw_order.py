"""31f060 raw-score quicksort and32ebf0 native duplicate pruning."""
import struct
from native_spectral import f32


def native_raw_score_order(raw_records,indices=None):
    """The original first-pivot descending quicksort, including equal ordering."""
    order=list(range(len(raw_records))) if indices is None else list(indices)
    def score(index):return struct.unpack_from('<f',raw_records[index],8)[0]
    pending=[(0,len(order))]
    while pending:
        start,stop=pending.pop()
        if start>=stop-1:continue
        pivot=order[start];left=start;right=stop-1
        while left<right:
            while left<right and score(pivot)>=score(order[right]):right-=1
            if left<right:order[left]=order[right];left+=1
            while left<right and score(order[left])>=score(pivot):left+=1
            if left<right:order[right]=order[left];right-=1
        order[left]=pivot
        #Native stack processes the right partition before the left. Disjoint
        #partitions have no observable interaction beyond this exact pivoting.
        pending.append((start,left));pending.append((left+1,stop))
    return tuple(order)


def prune_native_raw_duplicates(raw_records,indices):
    """32ebf0 marks later close-f0 records zero then compacts its index list."""
    records=[bytearray(record) for record in raw_records]
    if any(len(record)!=0xd94 for record in records):raise ValueError('Native raw records must be0xd94 bytes')
    order=tuple(indices)
    for pos,index in enumerate(order):
        frequency,pitch=struct.unpack_from('<f',records[index],0)[0],struct.unpack_from('<f',records[index],0x18)[0]
        if frequency==0:continue
        balance,=struct.unpack_from('<h',records[index],0xd90)
        for later in order[pos+1:]:
            other_frequency,=struct.unpack_from('<f',records[later],0)
            if other_frequency==0:continue
            other_balance,=struct.unpack_from('<h',records[later],0xd90)
            if abs(balance-other_balance)>0x7000:continue
            other_pitch,=struct.unpack_from('<f',records[later],0x18)
            pitch_delta=f32(other_pitch-pitch) if pitch<other_pitch else f32(pitch-other_pitch)
            frequency_delta=f32(other_frequency-frequency) if pitch<other_pitch else f32(frequency-other_frequency)
            if pitch_delta<f32(.4) or frequency_delta<f32(6.5):
                struct.pack_into('<f',records[later],0,0.)
    remaining=tuple(index for index in order if struct.unpack_from('<f',records[index],0)[0]!=0)
    return tuple(bytes(record) for record in records),remaining
